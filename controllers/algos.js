var levenshtein = require('fast-levenshtein');
var FuzzySet = require("fuzzyset.js");
module.exports.levenshtein = function(src1, src2, gramSize){
    let gram = gramSize || 2;
    let gram2 = gramSize || 2;
    console.log(gram, gram2);
    let loopcount = 0;
    let src1A = actualArray(src1.split(" "));
    let src2A = actualArray(src2.split(" "));
    let Plags = [];
    let PlagsDA = [];
    PlagWords = {};
    PlagWords.src = [];
    PlagWords.dst = [];
    for (let i = 0, k = 0; (src1A.length >= (i + gram2)); i = i + gram, k++) {
        let srcWord = src1A.slice(i, i + gram2).join(" ");
        //console.log("i", i, srcWord);
        PlagsDA[k] = [];
        
        for (let j = 0, l = 0; (src2A.length >= (j + gram2)); j = j + gram, l++) {
            let dstWord = src2A.slice(j, j + gram2).join(" ");
  
            let maxLength = Math.max(dstWord.length, srcWord.length);
            let plag = (maxLength - levenshtein.get(srcWord, dstWord)) / maxLength;
            console.log("j", j, srcWord, dstWord, plag);
            if (plag) {
                Plags.push(plag);
                PlagsDA[k][l] = plag;
                PlagWords.src.push(srcWord);
                PlagWords.dst.push(dstWord);
            } else {
                Plags.push(0);
                PlagsDA[k][l] = 0;
            }
            loopcount++;
        }
        loopcount++;
    }
    // console.log("loopcount", loopcount);
    let sum = 0.0;
    let length = 0;
  
    for (let i = 0; i < Plags.length; i++) {
        sum += Plags[i]
    }
  
    for (let i = 0; i < Plags.length; i++) {
        if (Plags[i] > 0)
            length++;
    }
    let sumD = 0;
    let max = 0;
    // console.log("PlagsDA", PlagsDA);
    for (let i = 0; i < PlagsDA.length; i++) {
        max = PlagsDA[i][0];
        for (let j = 0; j < PlagsDA[i].length; j++) {
            if (PlagsDA[i][j] > max) {
                max = PlagsDA[i][j];
            }
        }
        sumD += max;
    }
   // console.log("old split plagarism", (sum / length) * 100);
    return { plag: (sumD / PlagsDA.length) * 100, plagwords: PlagWords };
}

module.exports.fuzzySet = function(src1, src2, gramSize){
    let gram = gramSize || 2;
    let gram2 = gramSize || 2;
    console.log(gram, gram2);
    let loopcount = 0;
    let src1A = actualArray(src1.split(" "));
    let src2A = actualArray(src2.split(" "));
    let Plags = [];
    let PlagsDA = [];
    PlagWords = {};
    PlagWords.src = [];
    PlagWords.dst = [];
    for(let i=0,k=0; (src1A.length>=(i+gram2)) ; i=i+gram,k++){
        let srcWord = src1A.slice(i,i+gram2).join(" ");
        //console.log("i", i, srcWord);
        PlagsDA[k] = [];
        for(let j=0, l=0; (src2A.length>=(j+gram2)); j=j+gram,l++){
            let dstWord = src2A.slice(j, j+gram2).join(" ");
          //  console.log("j", j, srcWord, dstWord);
            let srcFuzz = FuzzySet([srcWord]);
            let plag = srcFuzz.get(dstWord);
            if(plag && plag.length > 0){
                Plags.push(plag[0][0]);
                PlagsDA[k][l] = plag[0][0];
                PlagWords.src.push(srcWord);
                PlagWords.dst.push(dstWord);
            }else{
                Plags.push(0);
                PlagsDA[k][l] = 0;
            }
            loopcount++;
        }
        loopcount++;
    }
    //console.log("loopcount", loopcount);
    let sum = 0.0; 
    let length = 0;

    for(let i=0; i<Plags.length;i++){
        sum+= Plags[i]
    }

    for(let i=0; i<Plags.length;i++){
        if(Plags[i] >0)
            length++;
    }
    let sumD = 0;
    let max = 0;
    //console.log("PlagsDA",PlagsDA);
    for(let i=0; i<PlagsDA.length;i++){
        max = PlagsDA[i][0];
        for(let j=0; j<PlagsDA[i].length;j++){
            if(PlagsDA[i][j] > max){
                max = PlagsDA[i][j];
            }
        }
        sumD += max;
    }
    //console.log("old split plagarism",(sum/length)*100);
    return { plag: (sumD/PlagsDA.length)*100, plagwords: PlagWords };
}


function actualArray(array) {
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] && array[i].length > 0) {
            newArray.push(array[i]);
        }
    }
    return newArray;
}
  