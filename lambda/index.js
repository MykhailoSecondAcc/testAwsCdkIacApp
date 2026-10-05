exports.handler = async (event, context) => {
  
  const time = new Date().toUTCString()
  const message = `Hello from lambda, current time: ${time}`

  return {
    statusCode: 200,
    body: JSON.stringify({
      message,
      text: "apple",
    })
  }
}
