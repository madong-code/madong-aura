import AntDesignIcons from '@iconify/json/json/ant-design.json';
import CarbonIcons from '@iconify/json/json/carbon.json';
import IcIcons from '@iconify/json/json/ic.json';
import LogosIcons from '@iconify/json/json/logos.json';
import LucideIcons from '@iconify/json/json/lucide.json';

import { addCollection } from '#/core/design/icons';

addCollection(AntDesignIcons);
addCollection(LucideIcons);
addCollection(CarbonIcons);
addCollection(IcIcons as any);
addCollection(LogosIcons as any);
