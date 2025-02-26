export class TokenLimits {
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'gpt-3.5-turbo') {
    this.knowledgeCutOff = '2021-09-01'
    
    // Extract the base model name from OpenRouter format (e.g., "openai/gpt-4" -> "gpt-4")
    const baseModel = model.includes('/') ? model.split('/')[1] : model
    
    if (
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
      baseModel === 'gpt-4-0613' ||
      baseModel === 'claude-2' ||
      baseModel === 'claude-2.0' ||
      baseModel === 'claude-2.1'
    ) {
      this.maxTokens = 8000
      this.responseTokens = 2000
    } else if (
      baseModel === 'claude-instant-1' ||
      baseModel === 'claude-instant-1.2'
    ) {
      this.maxTokens = 100000 // Claude Instant has a very large context window
      this.responseTokens = 2000
    } else {
      // Default for gpt-3.5-turbo and other models
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
