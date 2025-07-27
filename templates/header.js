export default `
    <header class="header">
        <nav class="navbar navbar-expand-lg navbar-light bg-light" aria-label="Navbar">
            <div class="container">
                <a class="navbar-brand" href="/">Video Sharing App</a>
                <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#navbarsExample05" aria-controls="navbarsExample05" 
                    aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="navbar-collapse collapse" id="navbarsExample05">
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link" aria-current="page" href="/">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-new" aria-current="page" href="/">New</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-liked" aria-current="page" href="/">Liked</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link link-watched" aria-current="page" href="/">Watched</a>
                        </li>
                    </ul>
                    <form class="d-flex flex-column flex-xs-column flex-md-row form-search">
                        <input class="form-control me-2 mb-3 mb-md-0 input-search" type="search" placeholder="Search" aria-label="Search">
                        <button class="btn btn-search" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </nav>
    </header>
`;
