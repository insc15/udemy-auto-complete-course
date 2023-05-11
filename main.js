"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c;
const courseID = (_c = (_b = (_a = document.querySelector('div[data-module-id=course-taking]')) === null || _a === void 0 ? void 0 : _a.getAttribute('data-module-args')) === null || _b === void 0 ? void 0 : _b.match(/"course_id":(\d+)/)) === null || _c === void 0 ? void 0 : _c[1];
function getLectures(courseID) {
    return __awaiter(this, void 0, void 0, function* () {
        console.clear();
        console.log('Getting lectures...');
        const res = yield fetch(`https://fpl.udemy.com/api-2.0/courses/${courseID}/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,object_index,is_published,sort_order,created,asset,supplementary_assets,is_free&fields[quiz]=title,object_index,is_published,sort_order,type&fields[practice]=title,object_index,is_published,sort_order&fields[chapter]=title,object_index,is_published,sort_order&fields[asset]=title,filename,asset_type,status,time_estimation,is_external&caching_intent=True`);
        const data = yield res.json();
        const lectures = data.results.filter((item) => item._class === 'lecture');
        console.log('Got lectures');
        return lectures;
    });
}
function completeLecture(lectures) {
    return __awaiter(this, void 0, void 0, function* () {
        lectures.forEach((lecture) => __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`https://fpl.udemy.com/api-2.0/users/me/subscribed-courses/${courseID}/completed-lectures/`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify({
                    lecture_id: lecture.id,
                    downloaded: false,
                }),
            });
            if (res.status === 201) {
                console.log('Completed lecture: ' + lecture.title);
            }
        }));
    });
}
getLectures(courseID).then((lectures) => {
    completeLecture(lectures);
});
