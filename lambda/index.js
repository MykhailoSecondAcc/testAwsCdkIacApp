exports.handler = async (event, context) => {
  
  const d = new Date()
  const p = n => String(n).padStart(2, "0")
  const time = `${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`
  const message = `Hello from lambda, current version: v1, current time: ${time}`

  return {
    statusCode: 200,
    body: JSON.stringify({
      message,
      verson: "v1",
    })
  }
}
