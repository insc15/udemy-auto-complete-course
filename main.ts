const courseID : string | undefined | null = document.querySelector('div[data-module-id=course-taking]')?.getAttribute('data-module-args')?.match(/"course_id":(\d+)/)?.[1];

async function getLectures(courseID: string | undefined | null) : Promise<[]> {
    console.clear()
    console.log('Getting lectures...');
    const res = await fetch(`https://fpl.udemy.com/api-2.0/courses/${courseID}/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,object_index,is_published,sort_order,created,asset,supplementary_assets,is_free&fields[quiz]=title,object_index,is_published,sort_order,type&fields[practice]=title,object_index,is_published,sort_order&fields[chapter]=title,object_index,is_published,sort_order&fields[asset]=title,filename,asset_type,status,time_estimation,is_external&caching_intent=True`)
    const data = await res.json();
    const lectures = data.results.filter((item: any) => item._class === 'lecture');
    console.log('Got lectures');
    return lectures;
}

async function completeLecture(lectures : []) : Promise<void>{
    lectures.forEach(async (lecture : any) => {
        const res = await fetch(`https://fpl.udemy.com/api-2.0/users/me/subscribed-courses/${courseID}/completed-lectures/`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
            body: JSON.stringify({
                lecture_id: lecture.id,
                downloaded: false,
            }),
        });
        if(res.status === 201) {
            console.log('Completed lecture: ' + lecture.title);
        }
    });
}

getLectures(courseID).then((lectures) => {
    completeLecture(lectures);
})