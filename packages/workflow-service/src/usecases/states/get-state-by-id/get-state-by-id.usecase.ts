import { getState } from '../../../gateways/db/automation-store.adapter';

export function getStateByIdUsecase(type: string, id: string) {
  const status = getState(`${type}:${id}`);

  return {
    type,
    id,
    status,
    lastUpdate: new Date(),
  };
}
