var token = ''
var imgurl = 'http://img.ameimeika.com/'
// var apiurl = 'https://mpingtest.ameimeika.com/api'
// var apiurl = 'http://192.168.11.69:8081/api'
var apiurl = 'https://openapi.ameimeika.com/api'
var param = {}
var userId = ''
var accountId = ''
// jQuery.support.cors = true;
if (location.href.indexOf('user_token') > -1) {
    console.log(location.href.split('user_token=')[1])
    if (location.href.split('user_token=')[1].indexOf('&')) {
        var str = location.href.split('user_token=')[1]
        token = str.split('&')[0]
    } else {
        token = location.href.split('user_token=')[1]
    }
    console.log(token)
}
if (location.href.indexOf('user_id') > -1) {
    console.log(location.href.split('user_id=')[1])
    if (location.href.split('user_id=')[1].indexOf('&')) {
        var str = location.href.split('user_id=')[1]
        userId = str.split('&')[0]
    } else {
        userId = location.href.split('user_id=')[1]
    }
    console.log(token)
}
var http = {
    res: "",
    post: function (api, datas, success) {
        $.ajax({
            url: apiurl + api,
            type: "post",
            data: datas,
            dataType: "json",
            // xhrFields: {
            //     withCredentials: true
            // },
            // crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            // headers: { Authorization: "Bearer " + token },
            success: success,
            error: function (msg) {

            }
        })
    }
}
$('#file1').change(function (e) {
    upflie(e, '.img1')
})
$('#file2').change(function (e) {
    upflie(e, '.img2')
})
function upflie(e, className) {
    $(".loading").show()
    $(className)[0].opacity = 0
    var file = e.target.files[0] || e.dataTransfer.files[0];
    console.log(file)
    console.log(e.target.parentNode)
    var formData = new FormData(); //通过formdata上传
    formData.append("type", 1);
    formData.append("file", file);

    var that = e
    var reader = new FileReader();
    reader.readAsDataURL(file); //重要 以dataURL形式读取文件
    reader.onload = function(e) {
        // data = window.URL.createObjectURL(new Blob([e.target.result])) 转化为blob格式

        let data = e.target.result;

        //this.attach.customaryUrl = data;
        // 转化为base64
        // reader.readAsDataURL(file)
        // 转化为blob

        $(className)[0].opacity = 1
        that.target.parentNode.parentNode.style.display = "none"
        $(className)[0].src = data

        $(className)[0].parentNode.parentNode.style.display = "block"
    };
    $.ajax({
        url: apiurl + "/upload",//文档接口
        type: "post",
        data: formData,
        contentType: false,
        processData: false,
        //  headers: { Authorization: "Bearer " + token },
        mimeType: "multipart/form-data",
        success: function (data) {

            $(".loading").fadeOut(3000)
            console.log(data);
            data = JSON.parse(data)
            // alert('上传成功')
            if (data.code == '0') {
                console.log(data);
                $(className)[0].opacity = 1
                e.target.parentNode.parentNode.style.display = "none"
                $(className)[0].src = imgurl + data.data

                $(className)[0].parentNode.parentNode.style.display = "block"
                if (className == '.img1') {
                    param.identityImg = imgurl + data.data
                }
                if (className == '.img2') {
                    param.identityBackImg = imgurl + data.data
                }
            }
            msg(data.msg)
        },
        error: function (data) {
            $(".loading").fadeOut(3000)
            // alert('上传失败')
        }
    })
}
function detail() {
    http.post('/com.mmk.member.api.OpenUserProvider/1.0.0/getUserAuthInfo.html', JSON.stringify({ id: userId - 0 }), function (res) {
        console.log(res)
        if (res.code == 0) {
            var datas = res.data
            param = datas
            $('.name p').html(datas.realname)
            var identityType

            if (datas.identityType == 1) {
                identityType = '港澳'
            }
            if (datas.identityType == 2) {
                identityType = '台湾'
            }
            if (datas.identityType == 3) {
                identityType = '护照'
            }
            if (datas.identityType == 4) {
                identityType = '身份证'
            }
            $('.type p').html(identityType)
            $('.number p').html(datas.identity)

            if (datas.identityImg) {
                //有身份证
                $('.img1')[0].src = datas.identityImg.indexOf('http') > -1 ? datas.identityImg : imgurl + datas.identityImg
            } else {
                $('.img1')[0].parentNode.parentNode.style.display = "none"
                $('.imgup1').show()
            }
            if (datas.identityBackImg) {
                //有身份证
                $('.img2')[0].src = datas.identityBackImg.indexOf('http') > -1 ? datas.identityBackImg : imgurl + datas.identityBackImg
            } else {
                $('.img2')[0].parentNode.parentNode.style.display = "none"
                $('.imgup2').show()
            }

        }
    })

}
function msgfn() {
    http.post('/com.mmk.member.api.OpenUserWithdrawalsProvider/1.0.0/signAccount.html', JSON.stringify({ id: userId - 0 }), function (res) {
        console.log(res)
        accountId = res.data
        msg(res.msg)
    })

}
$('.btn').click(function () {
    console.log(param)
    if (!param.realname || !param.identityType || !param.identity) {
        msg('请先进行实名认证')
        return;
    }
    if (!param.identityImg || !param.identityBackImg) {
        msg('请上传证件照片')
        return;
    }
    param.id = param.id + ''

    http.post('/com.mmk.member.api.OpenUserProvider/1.0.0/updateIdentifyImg.html', JSON.stringify(param), function (res) {

        msg(res.msg)

        if (res.code == 0) {
            //跳转到新宝
            if (!accountId) {
                http.post('/com.mmk.member.api.OpenUserWithdrawalsProvider/1.0.0/signAccount.html', JSON.stringify({ id: userId - 0 }), function (res) {
                    console.log(res)
                    accountId = res.data
                    // location.href = 'https://integration.esign.xinshuiguanjia.com/?accountId=' + accountId
                    location.href = 'https://esign.xinshuiguanjia.com/?accountId=' + accountId
                })
            } else {
                // location.href = 'https://integration.esign.xinshuiguanjia.com/?accountId=' + accountId
                location.href = 'https://esign.xinshuiguanjia.com/?accountId=' + accountId
            }


            //  location.href="./success.html"
        }
    })

})

function msg(msg) {
    $('.alert').html(msg)
    $('.alert').show()
    setTimeout(function () {
        $('.alert').hide()
    }, 1500)
}

// msgfn()
detail()