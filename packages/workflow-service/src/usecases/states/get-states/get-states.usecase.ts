import { getAllStates } from '../../../gateways/db/automation-store.adapter';

export function getStatesUsecase() {
  return {
    success: true,
    states: getAllStates(),
  };
}
