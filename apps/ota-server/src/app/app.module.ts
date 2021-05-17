import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';
import { GitService } from './git/git.service';
import { GithubService } from './github/github.service';
import { PioBuilderService } from './pio/pio-builder.service';
import { BinaryProvider } from './binary/binary.provider';
import { GithubController } from './github/github.controller';

@Module({
  controllers: [AppController, GithubController],
  providers: [
    AppService,
    EventsGateway,
    PioBuilderService,
    GitService,
    GithubService,
    BinaryProvider
  ]
})
export class AppModule {}
