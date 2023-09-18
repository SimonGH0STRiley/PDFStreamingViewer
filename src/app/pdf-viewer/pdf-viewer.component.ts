
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
	@ViewChild("viewerCanvas")	viewerCanvas !: ElementRef;

	private	pdfUrl		:  string;
	private	currPageNum	:  number;
	private pdf			!: pdfJS.PDFDocumentProxy;

	private	canvas		!: HTMLCanvasElement;
	private context		!: CanvasRenderingContext2D;

	constructor() {
		this.pdfUrl			= "/assets/HAF-F16.pdf";
		this.currPageNum	= 1;
		pdfJS.GlobalWorkerOptions.workerSrc = pdfJsWorker;
	}

	ngAfterViewInit(): void {
		this.canvas		= this.viewerCanvas.nativeElement;
		this.context	= this.canvas.getContext("2d") as CanvasRenderingContext2D;
		console.time("load page")
		pdfJS.getDocument({
			url					: this.pdfUrl,
			rangeChunkSize		: 16 * 1024,
			disableRange		: false,
			disableAutoFetch	: true
		}).promise.then(pdf => {
			this.pdf = pdf;
			this.currPageNum = 381;
			this.renderCurrPage();
		});
	}

	private renderCurrPage(): void {
		this.pdf.getPage(this.currPageNum).then((page: pdfJS.PDFPageProxy) => {
			const viewport = page.getViewport({ scale: 1.5 });
			this.canvas.width = viewport.width;
			this.canvas.height = viewport.height;

			page.render({
				canvasContext: this.context,
				viewport
			}).promise.then(() => {
				page.cleanup();
				console.timeEnd("load page")
			});
		});
	}

	public toPreviousPage(): void {
		this.currPageNum = Math.max(this.currPageNum - 1, 1);
		this.renderCurrPage();
	}

	public toNextPage(): void {
		this.currPageNum = Math.min(this.currPageNum + 1, this.pdf.numPages);
		this.renderCurrPage();
	}
}
