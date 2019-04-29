import {
    login, verify, signup, loginRequired, logout, profile, rateMentor, changeMentoringStatus, changeMentoredStatus,
    getMentored, getMentoring, getMentors, getMentorship, handleMentorship
}
    from "../controllers/userControllers";
import {
    createPost, unlikePost, likePost, listPost, rePost, search
}
        from "../controllers/contentController";

const routes = (app) => {

    //user handling routes
    app.route('/login')
        .post(login);
    app.route('/verify')
        .post(verify);
    app.route('/signup')
        .post(loginRequired, signup);
    app.route('/logout')
        .post(loginRequired, logout);
    app.route('/mentoring/:status')
        .post(loginRequired, changeMentoringStatus);
    app.route('/mentored/:status')
        .post(loginRequired, changeMentoredStatus);


    //content handling routes
    app.route('/post/create')
        .post(loginRequired, createPost);
    app.route('/post/list/:pageNumber')
        .post(loginRequired, listPost);
    app.route('/post/like')
        .post(loginRequired, likePost);
    app.route('/post/unlike')
        .post(loginRequired, unlikePost);
    app.route('/post/repost')
        .post(loginRequired, rePost);

    //
    app.route('/profile')
        .post(loginRequired, profile);
    app.route('/rate')
        .post(loginRequired, rateMentor);

    app.route('/mentors')
        .post(loginRequired, getMentors);
    app.route('/mentorship')
        .post(loginRequired, handleMentorship);
    // app.route('/mentoring')
    //     .post(loginRequired, getMentoring);
    app.route('/search')
        .post(loginRequired, search);
};

export default routes;
