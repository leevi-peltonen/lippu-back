import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new IoAdapter(app))
    app.enableCors({
        origin: 'https://6655a9fa76e36d0008e42999--courageous-bubblegum-433632.netlify.app',
        methods: ['GET', 'POST'],
        credentials: true,
    });

    await app.listen(3000);
}
bootstrap();
