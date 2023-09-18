
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as pdfJS from 'pdfjs-dist'
import pdfJsWorker from 'pdfjs-dist/build/pdf.worker.entry';

@Component({
	selector: 'app-pdf-viewer',
	templateUrl: './pdf-viewer.component.html',
	styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
	@ViewChild("viewerContainer") viewerContainer!: ElementRef;

	constructor() {
		const pdfUrl = '/assets/230109_Cancian_FirstBattle_NextWar.pdf'; // 替换为你的PDF文件路径

		pdfJS.GlobalWorkerOptions.workerSrc = pdfJsWorker;
		pdfJS.getDocument(pdfUrl).promise.then(pdf => {
			const numPages = pdf.numPages;
			const viewerContainer = this.viewerContainer.nativeElement;

			for (let pageNum = 1; pageNum <= numPages; pageNum++) {
				pdf.getPage(pageNum).then(page => {
					const canvas = document.createElement('canvas');
					viewerContainer.appendChild(canvas);

					const context = canvas.getContext('2d') as CanvasRenderingContext2D;
					const viewport = page.getViewport({ scale: 1.5 });
					canvas.width = viewport.width;
					canvas.height = viewport.height;

					page.render({
						canvasContext: context,
						viewport
					});
				});
			}
		});
	}
}
