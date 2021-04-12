import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsGateway } from './events.gateway';
import { GitService } from './git/git.service';
import { GithubService } from './github/github.service';
import { PioBuilderService } from './pio/pio-builder.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway,
    PioBuilderService,
    GitService,
    GithubService
  ]
})
export class AppModule {}
