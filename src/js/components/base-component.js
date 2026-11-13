export class BaseComponent extends HTMLElement {
	TEMPLATE_PATH = false;
    template = null;

    async connectedCallback() {
        if (!this.template && this.TEMPLATE_PATH) {
            await this.loadTemplate();
        }
    }

	async loadTemplate() {
        const res = await fetch(this.TEMPLATE_PATH);
        const html = await res.text();

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(html, 'text/html');

        const template = htmlDoc.querySelector('template');
        if (!template) {
            throw new Error(`Template not found in ${this.TEMPLATE_PATH}`);
        }

        this.template = template;
        this.innerHTML = template.innerHTML;
    }
}
