$('#add_user').on('click',function () {
    $.ajax({
        type:'POST',
        url: '/',
        success:function (err,res) {
            if(!err){
                console.log("REDIRECT");
                res.redirect('/newuser')
            }
        }
    })
})