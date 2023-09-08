import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly acceptAllButton: Locator;
    readonly womenCategory: Locator;
    readonly topsSubCategory: Locator;
    itemByProductId: Locator;
    readonly sizeButton: Locator;
    sizeOption: Locator;
    readonly addToBagButton: Locator;
    readonly viewBagButton: Locator;
    readonly shoppingBagHeader: Locator;

    constructor(page: Page) {
        this.page = page;
        this.acceptAllButton = page.getByRole('button', { name: 'Accept All' });
        this.womenCategory = page.getByRole('link', { name: 'Women Women' });
        this.topsSubCategory = page.locator('#top-navigation').getByRole('link', { name: 'Tops', exact: true }).first();
        this.sizeButton = page.getByRole('button', { name: 'Size', exact: true });
        this.addToBagButton = page.getByRole('button', { name: 'Add to Bag' });
        this.viewBagButton = page.getByRole('button', { name: 'View Bag' });
        this.shoppingBagHeader = page.getByRole('heading', { name: 'Shopping Bag' });
    }
    
    async navigate() {
        await this.page.goto('https://www.ae.com/us/en?from=ukeu');
    }

    async acceptAll() {
        await this.acceptAllButton.click();
    }

    async chooseTopsCategory() {
        await this.womenCategory.hover();
        await this.topsSubCategory.click({ timeout: 5000 });
    }

    async openItemPageByProductId(productId: string) {
        this.itemByProductId = this.page.locator('xpath=//div[@data-product-id = "' + productId +'"]//a[contains(@href, "' + productId +'")]').first();
        await this.itemByProductId.waitFor({state: "visible"});
        await this.itemByProductId.click({ timeout: 5000 });
    }

    async chooseSize(size: string) {
        this.sizeButton.click();
        this.sizeOption = this.page.getByRole('menuitem', { name: size });
        this.sizeOption.click();
    }

    async addItemToBag() {
        await this.addToBagButton.click({ timeout: 5000 });
        await this.viewBagButton.click({ timeout: 5000 });

        await expect(this.shoppingBagHeader).toBeVisible();
    }

}