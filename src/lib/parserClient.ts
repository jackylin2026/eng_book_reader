import type {
  ParseBookPayload,
  ParseError,
  ParseProgress,
  ParseRequest,
  ParseSuccess,
  ParseWorkerResponse,
} from '../types'

interface ParseResult {
  payload: ParseBookPayload
}

type ProgressHandler = (progress: ParseProgress['payload']) => void

export async function parseEbookInWorker(
  file: File,
  bookId: string,
  onProgress?: ProgressHandler,
): Promise<ParseResult> {
  const worker = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
    type: 'module',
  })

  return new Promise((resolve, reject) => {
    worker.onerror = (event) => {
      reject(new Error(event.message || 'Worker failed'))
      worker.terminate()
    }

    worker.onmessage = (event: MessageEvent<ParseWorkerResponse>) => {
      const message = event.data

      if (message.type === 'PARSE_PROGRESS') {
        onProgress?.(message.payload)
        return
      }

      if (message.type === 'PARSE_ERROR') {
        const parseError = message as ParseError
        reject(Object.assign(new Error(parseError.message), { code: parseError.code }))
        worker.terminate()
        return
      }

      const success = message as ParseSuccess
      resolve({ payload: success.payload })
      worker.terminate()
    }

    const request: ParseRequest = {
      type: 'PARSE_BOOK',
      file,
      fileName: file.name,
      bookId,
    }

    worker.postMessage(request)
  })
}
