import './fetch-polyfill'

import {info, setFailed, warning} from '@actions/core'
import {
  ChatGPTAPI,
  ChatGPTError,
  ChatMessage,
  SendMessageOptions
  // eslint-disable-next-line import/no-unresolved
} from 'chatgpt'
import pRetry from 'p-retry'
import {OpenAIOptions, Options} from './options'

// define type to save parentMessageId and conversationId
export interface Ids {
  parentMessageId?: string
  conversationId?: string
}

export class Bot {
  private readonly api: ChatGPTAPI | null = null // not free

  private readonly options: Options

  constructor(options: Options, openaiOptions: OpenAIOptions) {
    this.options = options
    const currentDate = new Date().toISOString().split('T')[0]
    const systemMessage = `${options.systemMessage} 
Knowledge cutoff: ${openaiOptions.tokenLimits.knowledgeCutOff}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`

    if (
      options.useOpenRouter &&
      (options.openRouterApiKey || process.env.OPENROUTER_API_KEY)
    ) {
      // Use OpenRouter
      const apiKey = options.openRouterApiKey || process.env.OPENROUTER_API_KEY

      if (!apiKey) {
        throw new Error(
          'OpenRouter API key is required when use_openrouter is true'
        )
      }

      // For OpenRouter, we need to add custom headers
      // Since ChatGPTAPI doesn't support headers in completionParams,
      // we'll need to use a custom fetch function to add the headers
      const customFetchFunction = (
        input: RequestInfo | URL,
        init?: RequestInit
      ): Promise<Response> => {
        // Add OpenRouter required headers
        if (init && init.headers) {
          const headers = {
            ...init.headers,
            'HTTP-Referer': 'https://github.com/coderabbitai/ai-pr-reviewer',
            'X-Title': 'AI PR Reviewer'
          }
          return fetch(input, {...init, headers})
        }
        return fetch(input, init)
      }

      this.api = new ChatGPTAPI({
        apiBaseUrl: options.openRouterBaseUrl,
        systemMessage,
        apiKey,
        debug: options.debug,
        maxModelTokens: openaiOptions.tokenLimits.maxTokens,
        maxResponseTokens: openaiOptions.tokenLimits.responseTokens,
        completionParams: {
          temperature: options.openaiModelTemperature,
          model: openaiOptions.model
        },
        fetch: customFetchFunction
      })
    } else if (process.env.OPENAI_API_KEY) {
      // Use OpenAI
      this.api = new ChatGPTAPI({
        apiBaseUrl: options.apiBaseUrl,
        systemMessage,
        apiKey: process.env.OPENAI_API_KEY,
        apiOrg: process.env.OPENAI_API_ORG ?? undefined,
        debug: options.debug,
        maxModelTokens: openaiOptions.tokenLimits.maxTokens,
        maxResponseTokens: openaiOptions.tokenLimits.responseTokens,
        completionParams: {
          temperature: options.openaiModelTemperature,
          model: openaiOptions.model
        }
      })
    } else {
      const err =
        "Unable to initialize the API, neither 'OPENAI_API_KEY' nor 'OPENROUTER_API_KEY' environment variables are available"
      throw new Error(err)
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      if (e instanceof ChatGPTError) {
        warning(`Failed to chat: ${e}, backtrace: ${e.stack}`)
      }
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    ids: Ids
  ): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: ChatMessage | undefined

    if (this.api != null) {
      const opts: SendMessageOptions = {
        timeoutMs: this.options.openaiTimeoutMS
      }
      if (ids.parentMessageId) {
        opts.parentMessageId = ids.parentMessageId
      }
      try {
        response = await pRetry(() => this.api!.sendMessage(message, opts), {
          retries: this.options.openaiRetries
        })
      } catch (e: unknown) {
        if (e instanceof ChatGPTError) {
          const apiType = this.options.useOpenRouter ? 'OpenRouter' : 'OpenAI'
          info(
            `response: ${response}, failed to send message to ${apiType}: ${e}, backtrace: ${e.stack}`
          )
        }
      }
      const end = Date.now()
      info(`response: ${JSON.stringify(response)}`)
      const apiType = this.options.useOpenRouter ? 'OpenRouter' : 'OpenAI'
      info(
        `${apiType} sendMessage (including retries) response time: ${
          end - start
        } ms`
      )
    } else {
      setFailed('The API is not initialized')
    }
    let responseText = ''
    if (response != null) {
      responseText = response.text
    } else {
      const apiType = this.options.useOpenRouter ? 'OpenRouter' : 'OpenAI'
      warning(`${apiType} response is null`)
    }
    // remove the prefix "with " in the response
    if (responseText.startsWith('with ')) {
      responseText = responseText.substring(5)
    }
    if (this.options.debug) {
      const apiType = this.options.useOpenRouter ? 'OpenRouter' : 'OpenAI'
      info(`${apiType} responses: ${responseText}`)
    }
    const newIds: Ids = {
      parentMessageId: response?.id,
      conversationId: response?.conversationId
    }
    return [responseText, newIds]
  }
}
