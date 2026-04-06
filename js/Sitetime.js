(function(){
    var startDate = new Date('2024-02-22T23:43:41').getTime();//修改为你的time

    function Sitetime() {
        var now = new Date().getTime(); 
        var elapsed = now - startDate; 

        var days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
        var hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

        document.getElementById('uptime').textContent = '本站已稳定运行 ' +
            days + ' 天 ' +
            hours + ' 小时 ' +
            minutes + ' 分钟 ' +
            seconds + ' 秒';
    }
    Sitetime();
    setInterval(Sitetime, 1000);
})();