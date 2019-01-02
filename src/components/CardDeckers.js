import React from 'react';


export  class Carddeckers extends React.Component {

    render()
    {
        return(
        
            <React.Fragment>
            
            <div className="blue-boxes-head">
                <h4 className="align-self-center text-uppercase ">New &amp; Hot in Community</h4>
            </div>
               
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 card-deck">
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                                <div className="card-body">
                                    <h3 className="text-uppercase">Joe Rogan Learns About Blockchain</h3>
                                    <p>Revisiting the basics of blockchain technology on the Joe Rogan Experience podcast.</p>
                                    <a href="https://blog.singularitynet.io/joe-rogan-learns-about-blockchain-technology-with-dr-ben-goertzel-a9c17566d994" target="_blank">
                                        <button type="button" className="btn btn-primary">Read</button>
                                    </a>
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                                <div className="card-body">
                                    <h3 className="text-uppercase">Singularity Studio</h3>
                                    <p>SingularityNET &amp; Singularity Studio Blitzscaling Toward the Singularity</p>
                                    <a href="https://blog.singularitynet.io/singularitynet-singularity-studio-blitzscaling-toward-the-singularity-2c27919e6c76" target="_blank">
                                        <button type="button" className="btn btn-primary">Read</button>
                                    </a>
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                                <div className="card-body">
                                    <h3 className="text-uppercase">Data as Labor</h3>
                                    <p>Rethinking Jobs In The Information age as AI gets more prevalant and ubiqutious</p>
                                    <a href="https://blog.singularitynet.io/data-as-labour-cfed2e2dc0d4" target="_blank">
                                        <button type="button" className="btn btn-primary">Read</button>
                                    </a>
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                                <div className="card-body">
                                    <h3 className="text-uppercase">AGI &amp; The New Space Frontier</h3>
                                    <p>Exploring the evolution of technologies that will shape our lives</p>
                                    <a href="https://blog.singularitynet.io/room-for-innovation-403511a264a6" target="_blank">
                                        <button type="button" className="btn btn-primary">Read</button>
                                    </a>
                                </div>
                            </div>
                </div>
        </React.Fragment>
    
    
        )
    }
}


