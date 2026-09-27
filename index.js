import Fastify from 'fastify'

const app = Fastify({
  logger: true
})

app.get('/', function (req, reply) {
  reply.send({ hello: 'world' })
})

const PORT = process.env.PORT || 5000
app.listen({ port: PORT }, function (err, address) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})