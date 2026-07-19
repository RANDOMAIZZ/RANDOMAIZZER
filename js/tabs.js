const btns = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

btns.forEach(btn => {
    btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});
