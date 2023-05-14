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

async function getQuizzes(courseID: string | undefined | null) : Promise<[any]>  {
    console.clear()
    console.log('Getting quizzes...');
    const res = await fetch(`https://fpl.udemy.com/api-2.0/courses/${courseID}/subscriber-curriculum-items/?page_size=200&fields[lecture]=title,object_index,is_published,sort_order,created,asset,supplementary_assets,is_free&fields[quiz]=title,object_index,is_published,sort_order,type&fields[practice]=title,object_index,is_published,sort_order&fields[chapter]=title,object_index,is_published,sort_order&fields[asset]=title,filename,asset_type,status,time_estimation,is_external&caching_intent=True`)
    const data = await res.json();
    const quizzes = data.results.filter((item: any) => item._class === 'quiz'); 
    console.log('Got quizzes');
    return quizzes;
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

async function completeQuiz(quizzes : [any]) : Promise<void>{
    console.log('Completing quizzes...');
    for (const quiz of quizzes) {
        console.log('Completing quiz: ' + quiz.title);
        let userAttemptID :any = null;
        
        try {
            const previousAttempts_RES = await fetch(`https://fpl.udemy.com/api-2.0/users/me/subscribed-courses/${courseID}/quizzes/${quiz.id}/user-attempted-quizzes/latest/?fields[user_attempted_quiz]=id,created,viewed_time,completion_time,version,completed_assessments,results_summary`)
            const { id : previousAttemptID } = await previousAttempts_RES.json();

            if(!previousAttemptID || previousAttemptID.detail){
                const userAttemptID_RES = await fetch(`https://fpl.udemy.com/api-2.0/users/me/subscribed-courses/${courseID}/quizzes/${quiz.id}/user-attempted-quizzes/?fields[user_attempted_quiz]=id,created,viewed_time,completion_time,version,completed_assessments,results_summary`,
                    {
                        method: "POST",
                        headers: {
                            "content-type": "application/json;charset=UTF-8",
                        },
                        body: JSON.stringify({
                            is_viewed: true,
                        }),
                    }
                )
                const { id : userAttemptIDx } = await userAttemptID_RES.json();
                userAttemptID = userAttemptIDx;
            }else{
                userAttemptID = previousAttemptID;
            }
        } catch (error) {
            
        }
        
        const quizData_RES = await fetch(`https://fpl.udemy.com/api-2.0/quizzes/${quiz.id}/assessments/?version=1&page_size=250&fields[assessment]=id,assessment_type,prompt,correct_response,section,question_plain,related_lectures`,
            {
                method: "GET",
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                },
            }
        )
        const { results: quizData } = await quizData_RES.json();
        for (const question of quizData) {
            await fetch(`https://fpl.udemy.com/api-2.0/users/me/subscribed-courses/${courseID}/user-attempted-quizzes/${userAttemptID}/assessment-answers/`,
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/json;charset=UTF-8",
                    },
                    body: JSON.stringify({
                        assessment_id: question.id,
                        duration: 15,
                        response: JSON.stringify(question.correct_response),
                    }),
                }
            )
        }
    }
}

getLectures(courseID).then((lectures) => {
    completeLecture(lectures).then(() => {
        getQuizzes(courseID).then((quizzes) => {
            completeQuiz(quizzes).then(() => {
                console.log('Done');
            })
        })
    })
})