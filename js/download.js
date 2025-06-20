document.addEventListener("DOMContentLoaded", function () {
    const downloadBtn = document.getElementById("downloadBtn");

    downloadBtn.addEventListener("click", function () {
        const link = document.createElement("a");
        link.href = "downloads/pixelfps.rar"; // Указываем путь к файлу
        link.download = "pixelfps.rar"; // Имя файла при скачивании
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
