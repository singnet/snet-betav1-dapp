const { ChunkParser, ChunkType } = require("grpc-web-client/dist/ChunkParser") 

async function processResponse(response, callback) {
  console.log(response);
  let error = null, chunk = null;

  if (response.ok) {
    var buffer = await response.arrayBuffer();
    chunk = parseChunk(buffer);
    var grpcMessage = response.headers.get('Grpc-Message');
    if (grpcMessage != null && chunk == null) {
      error = grpcMessage;
    }
  }
  else {
    let errorStatus = "Connection failed"
    if(typeof response.statusText !== 'undefined') {
      errorStatus = response.statusText;
    }
    error = "Request failed with error ["+errorStatus+"]. Please retry in some time."
  }

  try
  {
    callback(error, chunk && chunk.data ? new Uint8Array(chunk.data) : null);
  }
  catch(err) {
      console.log(err);
      callback(err);
  }
}

export function rpcImpl(host, packageName, serviceName, methodName, requestHeaders) {
  return (method, requestObject, callback) => {
    const service = [ packageName, serviceName ].filter(Boolean).join(".")
    window.fetch(`${host}/${service}/${methodName}`, {
      "method": "POST",
      "headers": Object.assign(
        {},
        {
          "content-type": "application/grpc-web+proto",
          "x-grpc-web": "1"
        },
        requestHeaders
      ),
      "body": frameRequest(requestObject)
    })
      .then(response => {processResponse(response, callback)}).catch(err => callback(err))
  }
}

function grpcJSONResponseToString(arrayBuffer) {
  const responseLength = new DataView(arrayBuffer).getUint8(4)
  const unframedResponse = new Uint8Array(arrayBuffer.slice(5, responseLength+5))
  return String.fromCharCode(...unframedResponse)
}

function frameRequest(bytes) {
  const frame = new ArrayBuffer(bytes.byteLength + 5)
  new DataView(frame, 1, 4).setUint32(0, bytes.length, false)
  new Uint8Array(frame, 5).set(bytes)
  return new Uint8Array(frame)
}

function parseChunk(buffer) {
  return new ChunkParser()
    .parse(new Uint8Array(buffer))
    .find(chunk => chunk.chunkType === ChunkType.MESSAGE)
}

export function grpcRequest(serviceObject, methodName, requestObject) {
  methodName = methodName.charAt(0).toLowerCase() + methodName.substr(1)
  if (!serviceObject[methodName]) throw new Error(`Service does not have method ${methodName}. ${serviceObject}`)

  return serviceObject[methodName](requestObject)
}
