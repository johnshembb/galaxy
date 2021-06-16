import { mount } from "@vue/test-utils";
import PairedListCollectionCreator from "components/Collections/PairedListCollectionCreator";
import DATA from "../../../tests/qunit/test-data/paired-collection-creator.data.js";

describe("PairedListCollectionCreator", () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(PairedListCollectionCreator, {
            propsData: {
                initialElements: DATA._1,
                creationFn: () => {
                    return;
                },
                oncreate: () => {
                    return;
                },
                oncancel: () => {
                    return;
                },
                hideSourceItems: false,
            },
        });
        await wrapper.vm.$nextTick();
    });

    afterEach(async () => {
        await wrapper.vm.$nextTick();
    });

    it("autopairs the dataset", async () => {
        // Autopair is called on startup
        expect(wrapper.findAll("li.dataset unpaired").length == 0).toBeTruthy();
    });

    it("selects the correct name for an auotpair", async () => {
        wrapper = mount(PairedListCollectionCreator, {
            propsData: {
                initialElements: DATA._2,
                creationFn: () => {
                    return;
                },
                oncreate: () => {
                    return;
                },
                oncancel: () => {
                    return;
                },
                hideSourceItems: false,
            },
        });
        await wrapper.vm.$nextTick();
        //change filter to .1.fastq/.2.fastq
        wrapper.find("div.forward-unpaired-filter > div.input-group-append > button").trigger("click");
        wrapper
            .findAll("div.dropdown-menu > a.dropdown-item")
            .wrappers.find((e) => e.text() == ".1.fastq")
            .trigger("click");
        await wrapper.vm.$nextTick();
        //assert forward filter
        const forwardFilter = wrapper.find("div.forward-unpaired-filter > input").element.value;
        expect(forwardFilter).toBe(".1.fastq");
        //assert reverse filter
        const reverseFilter = wrapper.find("div.reverse-unpaired-filter > input").element.value;
        expect(reverseFilter).toBe(".2.fastq");
        // click Autopair
        wrapper.find("a.autopair-link").trigger("click");
        await wrapper.vm.$nextTick();
        //assert pair-name longer name
        const pairname = wrapper.find("span.pair-name");
        expect(pairname.text()).toBe("DP134_1_FS_PSII_FSB_42C_A10");
    });

    it("removes the period from autopair name", async () => {
        wrapper = mount(PairedListCollectionCreator, {
            propsData: {
                initialElements: DATA._3,
                creationFn: () => {
                    return;
                },
                oncreate: () => {
                    return;
                },
                oncancel: () => {
                    return;
                },
                hideSourceItems: false,
            },
        });
        await wrapper.vm.$nextTick();
        //change filter to .1.fastq/.2.fastq
        wrapper.find("div.forward-unpaired-filter > div.input-group-append > button").trigger("click");
        wrapper
            .findAll("div.dropdown-menu > a.dropdown-item")
            .wrappers.find((e) => e.text() == ".1.fastq")
            .trigger("click");
        await wrapper.vm.$nextTick();
        //assert forward filter
        const forwardFilter = wrapper.find("div.forward-unpaired-filter > input").element.value;
        expect(forwardFilter).toBe(".1.fastq");
        //assert reverse filter
        const reverseFilter = wrapper.find("div.reverse-unpaired-filter > input").element.value;
        expect(reverseFilter).toBe(".2.fastq");
        // click Autopair
        wrapper.find("a.autopair-link").trigger("click");
        await wrapper.vm.$nextTick();
        //assert pair-name longer name
        const pairname = wrapper.find("span.pair-name");
        expect(pairname.text()).toBe("UII_moo_1");
    });
});
