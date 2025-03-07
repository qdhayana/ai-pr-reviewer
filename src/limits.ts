export class TokenLimits {
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'gpt-3.5-turbo') {
    this.knowledgeCutOff = '2023-04-01' // Updated knowledge cutoff date

    // Extract the base model name from OpenRouter format (e.g., "openai/gpt-4" -> "gpt-4")
    const baseModel = model.includes('/') ? model.split('/')[1] : model

    // Modern OpenAI models
    if (baseModel === 'gpt-4o' || baseModel === 'gpt-4o-2024-05-13') {
      this.maxTokens = 128000
      this.responseTokens = 4096
    } else if (
      baseModel === 'gpt-4-turbo' ||
      baseModel === 'gpt-4-turbo-2024-04-09' ||
      baseModel === 'gpt-4-turbo-preview'
    ) {
      this.maxTokens = 128000
      this.responseTokens = 4096
    } else if (
      baseModel === 'gpt-4-vision-preview' ||
      baseModel === 'gpt-4-vision'
    ) {
      this.maxTokens = 128000
      this.responseTokens = 4096
    } else if (
      baseModel === 'gpt-4-32k' ||
      baseModel === 'gpt-4-32k-0314' ||
      baseModel === 'gpt-4-32k-0613'
    ) {
      this.maxTokens = 32600
      this.responseTokens = 4000
    } else if (
      baseModel === 'gpt-3.5-turbo-16k' ||
      baseModel === 'gpt-3.5-turbo-16k-0613'
    ) {
      this.maxTokens = 16300
      this.responseTokens = 3000
    } else if (
      baseModel === 'gpt-4' ||
      baseModel === 'gpt-4-0314' ||
      baseModel === 'gpt-4-0613'
    ) {
      this.maxTokens = 8000
      this.responseTokens = 2000
    }
    // Modern Claude models
    else if (
      baseModel === 'claude-3-opus-20240229' ||
      baseModel === 'claude-3-opus'
    ) {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (
      baseModel === 'claude-3.5-sonnet' ||
      baseModel === 'claude-3-5-sonnet-20240620'
    ) {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (
      baseModel === 'claude-3.7-sonnet' ||
      baseModel === 'claude-3-7-sonnet'
    ) {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (
      baseModel === 'claude-3-sonnet-20240229' ||
      baseModel === 'claude-3-sonnet'
    ) {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (
      baseModel === 'claude-3-haiku-20240307' ||
      baseModel === 'claude-3-haiku'
    ) {
      this.maxTokens = 200000
      this.responseTokens = 4096
    } else if (
      baseModel === 'claude-2' ||
      baseModel === 'claude-2.0' ||
      baseModel === 'claude-2.1'
    ) {
      this.maxTokens = 100000
      this.responseTokens = 2000
    } else if (
      baseModel === 'claude-instant-1' ||
      baseModel === 'claude-instant-1.2'
    ) {
      this.maxTokens = 100000
      this.responseTokens = 2000
    }
    // Deepseek models
    else if (
      baseModel === 'deepseek-chat' ||
      baseModel === 'deepseek-v3' ||
      baseModel === 'deepseek-coder'
    ) {
      this.maxTokens = 32000
      this.responseTokens = 4096
    } else if (
      baseModel === 'deepseek-reasoning' ||
      baseModel === 'deepseek-r1'
    ) {
      this.maxTokens = 32000
      this.responseTokens = 4096
    }
    // Mistral models
    else if (
      baseModel === 'mistral-large-2' ||
      baseModel === 'mistral-large-latest'
    ) {
      this.maxTokens = 32000
      this.responseTokens = 4096
    } else if (
      baseModel === 'mistral-medium' ||
      baseModel === 'mistral-medium-latest'
    ) {
      this.maxTokens = 32000
      this.responseTokens = 4096
    } else if (
      baseModel === 'mistral-small' ||
      baseModel === 'mistral-small-latest' ||
      baseModel === 'o3-mini'
    ) {
      this.maxTokens = 32000
      this.responseTokens = 4096
    }
    // Default for other models
    else {
      this.maxTokens = 4000
      this.responseTokens = 1000
    }
    // provide some margin for the request tokens
    this.requestTokens = this.maxTokens - this.responseTokens - 100
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`
  }
}
