function main() {
    let results = []
    let main = $('div.item');
    let questions = main.find('div.title1');
    let options = main.find('div.ab');
    let array = []
    for (let i = 0; i < questions.length; i++) {
        let v = questions[i];
        let lineTxt = $(v).text().trim();
        lineTxt = lineTxt.replace(/\s+/g, '');
        array.push(lineTxt);
    }
    $.ajax({
        async: false,
        type: 'POST',
        dataType: 'json',
        url: 'http://localhost:8083',
        data: {
            'text': JSON.stringify(array)
        },
        success: function(r) {
            console.log(r)
            var qs = $('div.ab');
            for (let i = 0; i < qs.length; i++) {
                let q = qs[i];
                let os = $(q).find('input');
                let ops = $(q).find('.op');
                if (r[i] != null) {
                    for (let j = 0; j < ops.length; j++) {
                        let v = $(ops[j]).text();
                        if ((r[i]).indexOf(v.slice(0, 1)) >= 0 ||
                            (r[i]).indexOf(v.slice(v.length - 1, v.length)) >= 0) {
                            $(os[j]).attr('checked', 'true');
                            $(os[j])[0].checked = true;
                        };
                    };
                }
            };
        },
    });

}
$(function() {
    // if(window.document.location.pathname=='/wanbi.aspx'){
    //     location.href='index.aspx'
    // }
    // if($('a[href="login.aspx"]')[0]){
    //     $('a[href="login.aspx"]')[0].click()
    // }
    // setTimeout(() => {
    //     if($('a[href="index.aspx"]')[0]){
    //         $('a[href="index.aspx"]')[0].click()
    //     }
    // }, 500);
    // $('#ImageButton1').removeAttr('onclick')
    main()
})