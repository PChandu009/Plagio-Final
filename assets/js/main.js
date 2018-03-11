(function ($) {
    $.fn.serializeFormJSON = function () {

        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    $('.selectpicker').selectpicker({});
    $('[data-toggle="tooltip"]').tooltip(); 
})(jQuery);

function checkPlag(gram){
    gram = gram || 2;
    gram2 = gram || 2;
    let loopcount = 0;
    let src1A = actualArray($("#src1").val().split(" "));
    let src2A = actualArray($("#src2").val().split(" "));
    let Plags = [];
    let PlagsDA = [];
    for(let i=0,k=0; (src1A.length>=(i+gram2)) ; i=i+gram,k++){
        let srcWord = src1A.slice(i,i+gram2).join(" ");
        console.log("i", i, srcWord);
        PlagsDA[k] = [];
        for(let j=0, l=0; (src2A.length>=(j+gram2)); j=j+gram,l++){
            let dstWord = src2A.slice(j, j+gram2).join(" ");
            console.log("j", j, srcWord, dstWord);
            let srcFuzz = FuzzySet([srcWord]);
            let plag = srcFuzz.get(dstWord);
            if(plag && plag.length > 0){
                Plags.push(plag[0][0]);
                PlagsDA[k][l] = plag[0][0];
            }else{
                Plags.push(0);
                PlagsDA[k][l] = 0;
            }
            loopcount++;
        }
        loopcount++;
    }
    console.log("loopcount", loopcount);
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
    console.log("PlagsDA",PlagsDA);
    for(let i=0; i<PlagsDA.length;i++){
        max = PlagsDA[i][0];
        for(let j=0; j<PlagsDA[i].length;j++){
            if(PlagsDA[i][j] > max){
                max = PlagsDA[i][j];
            }
        }
        sumD += max;
    }
    console.log("old split plagarism",(sum/length)*100);
    return (sumD/PlagsDA.length)*100;
}

function directFuzzySet(){
    let src1A = $("#src1").val().split(" ");
    let src2A = $("#src2").val().split(" ");
    let a = FuzzySet([src1A.join(" ")]);
    let plag = a.get(src2A.join(" "));
    if(plag.length > 0){
        return plag[0][0]*100;
    }else{
        return 0;
    }
}

$("#chckplag").click(function(evt){
    evt.preventDefault();
    $("#progress").append("<img src='/images/progress.gif' width='50px' />");
    
    let gram = Number($("#gram").val());
    if(gram &&  gram==0){
        gram = 2;
    }
    
    $.ajax({
        type: "POST",
        url: '/levenplag',
        data: {source1:$("#src1").val(), source2:$("#src2").val(), gram:gram},
        success: function(data){
            if(data){
                $("#lplag").html(data["plag"]+"%");
            }
            console.log("leven distance", data);
            $("#progress").html("");
        }
    });
    $("#splag").html(checkPlag(gram)+"%");
    $("#dplag").html(directFuzzySet()+"%");

});

function actualArray(array){
    let newArray = [];
    for(let i=0; i<array.length; i++){
            if(array[i] && array[i].length>0){
                newArray.push(array[i]);
            }
    }
    return newArray;
}
