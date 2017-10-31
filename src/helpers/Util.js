const bitCount = (n) => {
	  n = n - ((n >> 1) & 0x55555555);
	  n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
	  return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
	};


const negMod = (n, m) => {
        return ((n % m) + m) % m;
	};


const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


const getSetBitIndices = (bits,maxlen) => {
	let positionsIndices = [];
	for( let i=0; i<24 ;i++ )
	{
		if( ((bits >> i) & 1) === 1 )
		{
			positionsIndices.push(i);
		}
	}
	return positionsIndices;

};


const shuffle = (array) => {
  let currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};


const getRandomSubarray = (array, size) => {
    var shuffled = array.slice(0), i = array.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

export {negMod, bitCount, getRandomInt, getRandomSubarray, getSetBitIndices, shuffle};
