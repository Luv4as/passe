import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const isStrictPositiveInteger = /^[1-9]\d*$/.test(value);

    if (!isStrictPositiveInteger) {
      throw new NotFoundException({
        message: `ID ${value} inválido ou inexistente.`,
      });
    }

    const parsedId = parseInt(value, 10);

    if (parsedId > 2147483647) {
      throw new NotFoundException({
        message: `ID ${value} excede o limite máximo permitido.`,
      });
    }

    return parsedId;
  }
}