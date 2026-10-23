interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (packages: string | string[], options?: { messageCallback?: (msg: string) => void; errorCallback?: (err: string) => void }) => Promise<void>
  loadPackagesFromImports: (code: string, options?: { messageCallback?: (msg: string) => void; errorCallback?: (err: string) => void }) => Promise<void>
  setStdout: (options: { batched: (output: string) => void }) => void
  setStderr: (options: { batched: (output: string) => void }) => void
}

declare global {
  interface Window {
    loadPyodide?: () => Promise<PyodideInterface>
  }
}

let pyodideInstance: PyodideInterface | null = null
let isLoadingPyodide = false
const loadCallbacks: Array<(pyodide: PyodideInterface) => void> = []

export async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance
  }

  if (isLoadingPyodide) {
    return new Promise((resolve) => {
      loadCallbacks.push(resolve)
    })
  }

  isLoadingPyodide = true

  if (!window.loadPyodide) {
    throw new Error("Pyodide script chưa sẵn sàng trong DOM.")
  }

  try {
    const pyodide = await window.loadPyodide()
    pyodideInstance = pyodide
    isLoadingPyodide = false
    loadCallbacks.forEach((cb) => cb(pyodide))
    loadCallbacks.length = 0
    return pyodide
  } catch (err) {
    isLoadingPyodide = false
    throw err
  }
}

export async function executePythonCode(
  code: string,
  onProgress?: (status: string) => void
): Promise<string> {
  const pyodide = await getPyodide()
  let output = ""

  pyodide.setStdout({
    batched: (text: string) => {
      output += text + "\n"
    },
  })

  pyodide.setStderr({
    batched: (text: string) => {
      output += "[STDERR] " + text + "\n"
    },
  })

  try {
    // 1. Tự động nhận diện và nạp các package phụ thuộc (như numpy, matplotlib,...)
    if (typeof pyodide.loadPackagesFromImports === "function") {
      onProgress?.("Đang kiểm tra và tải các thư viện Python phụ thuộc...")
      await pyodide.loadPackagesFromImports(code, {
        messageCallback: (msg: string) => {
          onProgress?.(msg)
        },
      })
    } else if (code.includes("numpy") && typeof pyodide.loadPackage === "function") {
      onProgress?.("Đang nạp gói numpy vào WebAssembly...")
      await pyodide.loadPackage("numpy")
    }

    // 2. Thực thi mã Python bất đồng bộ
    await pyodide.runPythonAsync(code)
    return output.trim() || "(Script thực thi thành công nhưng không có lệnh print stdout)"
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return `[LỖI PYTHON]:\n${errMsg}`
  }
}
