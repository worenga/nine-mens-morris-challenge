let bitCount = (n) => {
	  n = n - ((n >> 1) & 0x55555555);
	  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
	  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
	};


let negMod = (n, m) => {
        return ((n % m) + m) % m;
	};


let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export {negMod, bitCount, getRandomInt};
