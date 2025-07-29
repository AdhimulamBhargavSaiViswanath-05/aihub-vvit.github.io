// Drawing logic
const drawBtn = document.getElementById('draw-btn');
const clearBtn = document.getElementById('clear-btn');
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

drawBtn.onclick = () => {
    canvas.style.display = 'block';
    clearBtn.style.display = 'inline-block';
    drawBtn.style.display = 'none';
    resizeCanvas();
};
clearBtn.onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
    clearBtn.style.display = 'none';
    drawBtn.style.display = 'inline-block';
};
canvas.addEventListener('mousedown', e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mousemove', e => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

// Slides logic with progressive points
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const slideNumber = document.getElementById('slide-number');

function showSlide(idx) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === idx);
        if (i === idx) {
            // Hide all points except the first
            const points = slide.querySelectorAll('.point');
            points.forEach((pt, j) => {
                pt.style.display = j === 0 ? '' : 'none';
            });
            slide.setAttribute('data-point', 0);
        }
    });
    slideNumber.textContent = `Slide ${idx + 1} / ${slides.length}`;
}

document.getElementById('prev-slide').onclick = () => {
    if (currentSlide > 0) currentSlide--;
    showSlide(currentSlide);
};

document.getElementById('next-slide').onclick = () => {
    const slide = slides[currentSlide];
    const points = slide.querySelectorAll('.point');
    let shown = parseInt(slide.getAttribute('data-point') || 0, 10);

    if (shown < points.length - 1) {
        shown++;
        points[shown].style.display = '';
        slide.setAttribute('data-point', shown);
    } else if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
};

// Initialize on page load
showSlide(currentSlide);

// Download as PDF
document.getElementById('download-pdf').onclick = function() {
    // Hide controls that shouldn't appear in PDF
    document.getElementById('draw-controls').style.display = 'none';
    document.querySelector('.bottom-controls').style.display = 'none';

    html2canvas(document.body, {backgroundColor: "#fff"}).then(function(canvas) {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('experiment1.pdf');

        // Restore controls
        document.getElementById('draw-controls').style.display = '';
        document.querySelector('.bottom-controls').style.display = '';
    });
};
if (drawBtn && drawCanvas && drawControls) {
    drawBtn.onclick = () => {
      drawCanvas.style.display = 'block';
      drawControls.style.display = 'block';
      resizeCanvas();
      ctx = drawCanvas.getContext('2d');
    };
    window.addEventListener('resize', resizeCanvas);
  
    drawCanvas.addEventListener('mousedown', (e) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
    });
    drawCanvas.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    });
    drawCanvas.addEventListener('mouseup', () => {
      drawing = false;
    });
    drawCanvas.addEventListener('mouseleave', () => {
      drawing = false;
    });
    clearBtn.onclick = () => {
      ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    };
    closeDrawBtn.onclick = () => {
      drawCanvas.style.display = 'none';
      drawControls.style.display = 'none';
    };
    saveBtn.onclick = () => {
      // Hide controls to avoid capturing them
      drawControls.style.visibility = 'hidden';
      html2canvas(document.body).then(canvas => {
        drawControls.style.visibility = 'visible';
        const link = document.createElement('a');
        link.download = 'page_with_drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    };
  };