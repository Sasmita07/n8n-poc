import { getAllStates } from '../../../gateways/db/automation-store.adapter';

export function getStatesUsecase() {
  const states = getAllStates();

  return {
    success: true,
    states,
    result: Object.values(states),
  };
}
