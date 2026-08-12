import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'; //EjecutionContext es un objeto que contiene información sobre la solicitud entrante y el contexto de ejecución del guardia. Se utiliza para acceder a detalles como la solicitud HTTP, los parámetros de ruta, los encabezados, etc. CanActivate es una interface que define el contrato de un guardia de autorización.
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { userId: string }>(); //switchToHttp() permite acceder al contexto HTTP de la solicitud entrante. getRequest() obtiene el objeto de solicitud HTTP (request) que contiene información sobre la solicitud, como encabezados, parámetros, cuerpo, etc. En este caso, se está extendiendo el tipo Request para incluir una propiedad userId que se agregará después de verificar el token JWT.
    const token = request.cookies?.session_token as string | undefined;

    if (!token) {
      throw new UnauthorizedException('No autenticado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; type?: string }>(token);
      if (payload.type) {
        throw new UnauthorizedException('No autenticado');
      }
      request.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException('No autenticado');
    }
  }
}
