import { isFunction, isNil } from '@nestjs/common/utils/shared.utils'
import { AbstractWsAdapter, MessageMappingProperties } from '@nestjs/websockets'
import { DISCONNECT_EVENT } from '@nestjs/websockets/constants'
import { fromEvent, Observable } from 'rxjs'
import { filter, first, map, mergeMap, share, takeUntil } from 'rxjs/operators'
import { Server } from 'socket.io'

/**
 * This adapter is used instead of the included adapter (@nestjs/platform-socket.io) because the latter is not compatible with socket.io v3.
 * See https://github.com/nestjs/nest/issues/5676 for more details.
 * With v8 of NestJs, this should be fixed.
 */
export class IoAdapter extends AbstractWsAdapter {
  public create(
    port: number,
    options?: any & { namespace?: string; server?: any },
  ): any {
    if (!options) {
      return this.createIOServer(port)
    }
    const { namespace, server, ...opt } = options
    return server && isFunction(server.of)
      ? server.of(namespace)
      : namespace
      ? this.createIOServer(port, opt).of(namespace)
      : this.createIOServer(port, opt)
  }

  public createIOServer(port: number, options?: any): any {
    if (this.httpServer && port === 0) {
      return new Server(this.httpServer, options)
    }
    return new Server(port, options)
  }

  public bindMessageHandlers(
    client: any,
    handlers: MessageMappingProperties[],
    transform: (data: any) => Observable<any>,
  ) {
    const disconnect$ = fromEvent(client, DISCONNECT_EVENT).pipe(
      share(),
      first(),
    )

    handlers.forEach(({ message, callback }) => {
      const source$ = fromEvent(client, message).pipe(
        mergeMap((payload: any) => {
          const { data, ack } = this.mapPayload(payload)
          return transform(callback(data, ack)).pipe(
            filter((response: any) => !isNil(response)),
            map((response: any) => [response, ack]),
          )
        }),
        takeUntil(disconnect$),
      )
      source$.subscribe(([response, ack]) => {
        if (response.event) {
          return client.emit(response.event, response.data)
        }
        // tslint:disable-next-line:no-unused-expression
        isFunction(ack) && ack(response)
      })
    })
  }

  public mapPayload(payload: any): { data: any; ack?: Function } {
    if (!Array.isArray(payload)) {
      if (isFunction(payload)) {
        return { data: undefined, ack: payload }
      }
      return { data: payload }
    }
    const lastElement = payload[payload.length - 1]
    const isAck = isFunction(lastElement)
    if (isAck) {
      const size = payload.length - 1
      return {
        data: size === 1 ? payload[0] : payload.slice(0, size),
        ack: lastElement,
      }
    }
    return { data: payload }
  }
}