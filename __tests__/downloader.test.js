/**
 * @jest-environment node
 * 
 * Testing the Downloader class in index.js
 */
import Downloader from '../index';

jest.mock('../index');

// Clearing the mock before each test to avoid side effects
beforeEach(() => {
    Downloader.mockClear();
});


describe('Checking the constructor', () => {

    // Checking if the constructor is called
    it('We can check if the constructor is called', () => {
        const downloader = new Downloader();
        expect(Downloader).toHaveBeenCalledTimes(1);
    });

});

describe('Checking the fetch_course_data_by_class_id method', () => {

    let class_id = '1317209616';

    // Checking if the method is called
    it('We can check if the method is called', () => {
        const downloader = new Downloader();
        downloader.fetch_course_data_by_class_id('123456');
        expect(downloader.fetch_course_data_by_class_id).toHaveBeenCalledTimes(1);
    });

    // Checking if the method is called with the right arguments
    it('We can check if the method is called with the right arguments', () => {
        const downloader = new Downloader();
        downloader.fetch_course_data_by_class_id('123456');
        expect(downloader.fetch_course_data_by_class_id).toHaveBeenCalledWith('123456');
    });

    // Checking if the method returns a value
    it('Checking if the returned value is a JSON', () => {
        const downloader = new Downloader();
        expect(downloader.fetch_course_data_by_class_id(class_id)).toEqual(expect.anything());
    });

});