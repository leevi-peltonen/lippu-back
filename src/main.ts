import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // app.enableCors({
    //     origin: 'https://courageous-bubblegum-433632.netlify.app',
    //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //     credentials: true,
    // });

    await app.listen(3000);
}
bootstrap();
