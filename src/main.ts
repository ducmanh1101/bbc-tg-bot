import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import configuration from './config/configuration.js'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
    maxAge: 86400, // Cache preflight response for 24 hours
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  // Start
  const PORT = configuration().server.port
  await app.listen(PORT)

  console.info(`⚡️[server]: Server is running at ${await app.getUrl()} `)
}
bootstrap()
