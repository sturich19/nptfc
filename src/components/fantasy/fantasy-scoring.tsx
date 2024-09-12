const FantasyScoringTable = () => {

    return(
        <div className="row">            
            <h4>Scoring</h4>
            <div className="col-6">          
            <table className="table table-hover table-condensed table-responsive table-sm">
                    <thead>
                        <tr>
                            <th>Player</th>                              
                            <th>GK</th>  
                            <th>Def</th>
                            <th>Mid</th>                                          
                            <th>Str</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">                            
                        <tr>
                            <td className="col-2">Apps</td>                                                                
                            <td className="col-1">2</td>   
                            <td className="col-1">2</td>
                            <td className="col-1">2</td>
                            <td className="col-1">2</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Goals</td>                                                                
                            <td className="col-1">6</td>   
                            <td className="col-1">6</td>
                            <td className="col-1">5</td>
                            <td className="col-1">4</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Assist</td>                                                                
                            <td className="col-1">3</td>   
                            <td className="col-1">3</td>
                            <td className="col-1">3</td>
                            <td className="col-1">3</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">GSOs</td>                                                                
                            <td className="col-1">2</td>   
                            <td className="col-1">2</td>
                            <td className="col-1">1</td>
                            <td className="col-1">1</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Shots</td>                                                                
                            <td className="col-1">2</td>   
                            <td className="col-1">2</td>
                            <td className="col-1">1</td>
                            <td className="col-1">1</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Clean Sheets</td>                                                                
                            <td className="col-1">3</td>   
                            <td className="col-1">0</td>
                            <td className="col-1">0</td>
                            <td className="col-1">0</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Saves</td>                                                                
                            <td className="col-1">1</td>   
                            <td className="col-1">0</td>
                            <td className="col-1">0</td>
                            <td className="col-1">0</td>                                
                        </tr>
                        <tr>
                            <td className="col-2">Pen Saves</td>                                                                
                            <td className="col-1">3</td>   
                            <td className="col-1">3</td>
                            <td className="col-1">3</td>
                            <td className="col-1">3</td>                                
                        </tr>
                    </tbody>
            </table>
            </div>  
            <div className="col-6"></div>
        </div>   
    )

}

export default FantasyScoringTable;