
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as pdfJS from 'pdfjs-dist'
import pdfJsWorker from 'pdfjs-dist/build/pdf.worker.entry';

const loadTimeout = 3000;

@Component({
	selector: 'app-pdf-viewer',
	templateUrl: './pdf-viewer.component.html',
	styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
	@ViewChild("viewerContainer") viewerContainer!: ElementRef;
	@ViewChild("viewerCanvas")	viewerCanvas !: ElementRef;

	private	pdfUrls		:  Array<string>;
	private pdfIndex	:  number;
	private	currPageNum	:  number;
	private pdf			!: pdfJS.PDFDocumentProxy;

	private	canvas		!: HTMLCanvasElement;
	private context		!: CanvasRenderingContext2D;

	constructor() {
		this.pdfUrls		= ["/assets/DiscreteMathematicsAndItsApplications0.pdf", "/assets/DiscreteMathematicsAndItsApplications1.pdf", "/assets/DiscreteMathematicsAndItsApplications2.pdf", "/assets/input.pdf", "/assets/output.pdf"];
		this.pdfIndex		= 2;
		this.currPageNum	= 0;
		pdfJS.GlobalWorkerOptions.workerSrc = pdfJsWorker;
	}

	ngAfterViewInit(): void {
		this.canvas		= this.viewerCanvas.nativeElement;
		this.context	= this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.loadPDF();
	}

	private loadPDF(): void {
		console.time(`load pdf ${this.pdfIndex} page`);
		let loadingProgress: number = 0;
		const loadingTask = pdfJS.getDocument({
			url					: this.pdfUrls[this.pdfIndex],
			rangeChunkSize		: 16 * 1024,
			disableRange		: false,
			disableAutoFetch	: true,
		});
		loadingTask.onProgress = (progress: pdfJS.OnProgressParameters) => {
			loadingProgress = progress.loaded / progress.total;
		}
		loadingTask.promise.then((pdf: pdfJS.PDFDocumentProxy) => {
			pdf.getMetadata().then((metadata) => {
				console.log(metadata)
			});

			this.pdf = pdf;
			this.currPageNum = 513;
			// this.currPageNum = 10;
			this.renderPage();
		});
		Promise.race([
			loadingTask.promise,
			new Promise((resolve) => {
				setTimeout(resolve, loadTimeout);
			})
		]).then((result: any) => {
			console.log(result)
			if (result === undefined) {
				if (loadingProgress === 0) {
					throw new Error("Response Timeout.")
				}
			}
		}).catch(() => {
			console.timeEnd(`load pdf ${this.pdfIndex} page`);
			loadingTask.destroy();
			this.pdfIndex ++;
			this.loadPDF();
		});
	}

	private renderPage(): void {
		this.pdf.getPage(this.currPageNum).then((page: pdfJS.PDFPageProxy) => {
			console.log(page._pageInfo)
			const viewport = page.getViewport({ scale: 1.5 });
			this.canvas.width = viewport.width;
			this.canvas.height = viewport.height;
			console.timeEnd(`load pdf ${this.pdfIndex} page`);
			page.render({
				canvasContext: this.context,
				viewport
			}).promise.then(() => {
				page.cleanup();
			});
		});
	}

	public toPreviousPage(): void {
		this.currPageNum = Math.max(this.currPageNum - 1, 1);
		this.renderPage();
	}

	public toNextPage(): void {
		this.currPageNum = Math.min(this.currPageNum + 1, this.pdf.numPages);
		this.renderPage();
	}
}
