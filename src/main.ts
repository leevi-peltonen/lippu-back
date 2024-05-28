import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
const port = process.env.PORT || 3000;
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new IoAdapter(app))
    
    await app.listen(port, "0.0.0.0");
}
bootstrap();
