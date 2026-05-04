import { ENV } from './config';

export const BackdoorAvailable = () => {
  return ['LOCAL', 'DEV', 'PREPROD'].includes(ENV);
};
