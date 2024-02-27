export function getAdcodeBoundary(type: string) {
  const url = 'http://localhost:8700/json/bounds/' + type + '_bound.json'
  const request = new window.Request(url, {
    method: 'get'
  })
  return window.fetch(request)
  // return axios.get('http://10.105.255.28:8700/json/' + type + '-bounds.json')
}

export function getAdcodeGeoJson<R>(type: number): Promise<R> {
  return new Promise((resolve: (arg0: any) => void, reject: any) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      // 通信成功时，状态值为4
      if (xhr.readyState === 4){
        if (xhr.status === 200){
          resolve(JSON.parse(xhr.responseText))
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.open('GET', 'http://localhost:8700/json/' + type + '_full.json', true);
    xhr.send();
  })
}

// run函数为主要代码，该函数会将异步操作进行处理。
export function run<P>(func: (ags: P) => void, params: P): void {
  const cache: any[] = []
  let i = 0
  const _originalFetch = window.fetch
  window.fetch = (...args) => {
    if (cache[i]) {
      if (cache[i].status === 'fulfilled') {
        return cache[i].data
      } else if (cache[i].status === 'rejected') {
        throw cache[i].err
      }
    }
    const result: { status: string, data: any, err: any } = {
      status: 'pending',
      data: null,
      err: null
    }
    cache[i++] = result
    const prom = _originalFetch(...args)
      .then((resp) => resp.json())
      .then(
        (resp) => {
          result.status = 'fulfilled'
          result.data = resp
        },
        (err) => {
          result.status = 'rejected'
          result.data = err
        }
      )
    throw prom
  }
  try {
    func(params)
  } catch (err) {
    if (err instanceof Promise) {
      const reRun = () => {
        i = 0
        func(params)
      }
      err.then(reRun, reRun)
    }
  }
}
