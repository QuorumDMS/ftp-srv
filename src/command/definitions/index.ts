
import { CommandDefinition } from '../types';

import {USER} from './USER';
import {PASS} from './PASS';
import {ACCT} from './ACCT';
import {QUIT} from './QUIT';
import {PORT} from './PORT';

const registry = new Map<string, CommandDefinition<any>>();
registry.set('USER', USER);
registry.set('PASS', PASS);
registry.set('ACCT', ACCT);
registry.set('QUIT', QUIT);
registry.set('PORT', PORT);

export default registry;
