import { ApplicationError } from '@/protocols';

export function noAddressError(): ApplicationError {
  return {
    name: 'NoAddress',
    message: 'No address found',
  };
}
