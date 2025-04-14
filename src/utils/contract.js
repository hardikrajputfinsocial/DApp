import { ethers } from 'ethers';

import futureLongShort from '../abis/futureLongShort.json';
import LimitOrder from '../abis/LimitOrder.json';
import Market from '../abis/market.json';
import SacledOrder from '../abis/SacledOrder.json';
import SLTP from '../abis/SLTP.json';
import StopLimit from '../abis/stopLimt.json';
import TrailingFutures from '../abis/traillingFutures.json';
import TWAP from '../abis/TWAP.json';

const addresses = {
    futureLongShort: import.meta.env.VITE_FUTURE_LONG_SHORT,
    LimitOrder: import.meta.env.VITE_LIMIT_ORDER,
    Market: import.meta.env.VITE_MARKET,
    SacledOrder: import.meta.env.VITE_SACLED_ORDER,
    SLTP: import.meta.env.VITE_SLTP,
    StopLimit: import.meta.env.VITE_STOP_LIMIT,
    TrailingFutures: import.meta.env.VITE_TRAILLING_FUTURES,
    TWAP: import.meta.env.VITE_TWAP
};

export const getContracts = (providerOrSigner) => ({
    futureLongShort: new ethers.Contract(addresses.futureLongShort, futureLongShort, providerOrSigner),
    limitOrder: new ethers.Contract(addresses.LimitOrder, LimitOrder, providerOrSigner),
    market: new ethers.Contract(addresses.Market, Market, providerOrSigner),
    sacledOrder: new ethers.Contract(addresses.SacledOrder, SacledOrder, providerOrSigner),
    sltp: new ethers.Contract(addresses.SLTP, SLTP, providerOrSigner),
    stopLimit: new ethers.Contract(addresses.StopLimit, StopLimit, providerOrSigner),
    trailingFutures: new ethers.Contract(addresses.TrailingFutures, TrailingFutures, providerOrSigner),
    twap: new ethers.Contract(addresses.TWAP, TWAP, providerOrSigner)
});