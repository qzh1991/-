async function findAnswer(lineTxt) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'POST',
            url: 'localhost:8081',
            data: lineTxt,
            success: function (response) {
                resolve(response);
            },
            //dataType: json
        });
    });
}
function main() {
    let results = []
    const main = $('div.main')
    const questions = main.find('td[class="hs11"][valign="top"]')
    const options = main.find('.lanse11')
    for (let i = 0; i < questions.length; i++) {
        const v = questions[i];
        let lineTxt = $(v).text().trim()
        lineTxt = lineTxt.replace(/\s+/g, '')

        const r = await query(lineTxt)
        const an = r.length ? r[0].answer : ''
        results[i] = an
    }
    var qs = $('.lanse11');
    for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        const os = $(q).find('input');
        const ots = $(q).find('label');
        for (let j = 0; j < ots.length; j++) {
            const v = $(ots[j]).text();
            if ((results[i]).indexOf(v.slice(0, 1)) >= 0 ||
                (results[i]).indexOf(v.slice(v.length - 1, v.length)) >= 0) {
                $(os[j]).attr('checked', 'true');
                $(os[j])[0].checked = true;
            };
        };
    };
}
main()
