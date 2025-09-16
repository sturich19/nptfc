import { useFormik } from "formik";
import { Season } from "../../objects/season";
import { SeasonSetupDTO } from "../../objects/season-setup-dto";
import { Team } from "../../objects/team";
import TextField from "../../atoms/textfield/textfield";
import { GetSeasons, PostSeasonSetup } from "../../services/season-service";
import { GetTeams } from "../../services/teams-service";
import { GetLeagueTable } from "../../services/league-table-service";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const AdminSeason = ()  =>
{
    const navigate = useNavigate();
    const [existingSeasons, setExistingSeasons] = useState<Season[]>([]);
    const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
    const [showTeamSetup, setShowTeamSetup] = useState(false);
    const [editingSeason, setEditingSeason] = useState<Season | null>(null);

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const seasons = await GetSeasons();
                setExistingSeasons(seasons || []);
            } catch (error) {
                console.error("Error fetching existing seasons:", error);
            }
        };

        const fetchTeams = async () => {
            try {
                const teams = await GetTeams();
                setAllTeams(teams || []);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };

        fetchSeasons();
        fetchTeams();
    }, []);

    const formik = useFormik<{
        startYear: number;
        endYear: number;
        ageGroup: number;
        division: number;
        monthStart: string;
        monthEnd: string;
        active: boolean;
    }>({
        initialValues :{ startYear: new Date().getFullYear(), endYear: new Date().getFullYear(), ageGroup : 10, division : 2, monthStart: "September", monthEnd : "May", active: true},
        onSubmit : async values => {
            const seasonSetup : SeasonSetupDTO = {
                startYear: values.startYear,
                endYear: values.endYear,
                ageGroup: values.ageGroup,
                ageGroupId: values.ageGroup,
                division: values.division,
                monthStart: values.monthStart,
                monthEnd: values.monthEnd,
                active: values.active,
                teamIds: selectedTeams.map(team => team.id)
            };

            try {
                await PostSeasonSetup(seasonSetup);
                setFeedback({message: editingSeason ? 'Season updated successfully!' : 'Season created successfully!', type: 'success'});
                formik.resetForm();
                setSelectedTeams([]);
                setShowTeamSetup(false);
                setEditingSeason(null);

                const seasons = await GetSeasons();
                setExistingSeasons(seasons || []);

                setTimeout(() => setFeedback(null), 3000);
            } catch (error) {
                console.error("Error saving season:", error);
                setFeedback({message: 'Error saving season. Please try again.', type: 'error'});
                setTimeout(() => setFeedback(null), 3000);
            }
        }
    });

    const handleSetupTeams = async (season: Season) => {
        setEditingSeason(season);
        formik.setValues({
            startYear: season.startYear,
            endYear: season.endYear,
            ageGroup: season.ageGroup,
            division: season.division,
            monthStart: season.monthStart,
            monthEnd: season.monthEnd,
            active: season.active
        });

        try {
            const leagueTable = await GetLeagueTable(season.id);
            const seasonTeams = leagueTable?.map((entry: any) =>
                allTeams.find(team => team.id === entry.teamId)
            ).filter(Boolean) || [];
            setSelectedTeams(seasonTeams);
        } catch (error) {
            console.error("Error fetching season teams:", error);
            setSelectedTeams([]);
        }

        setShowTeamSetup(true);
    };

    const handleNewSeason = () => {
        setEditingSeason(null);
        formik.resetForm();
        setSelectedTeams([]);
        setShowTeamSetup(true);
    };

    const handleAddTeam = (team: Team) => {
        if (!selectedTeams.find(t => t.id === team.id)) {
            setSelectedTeams([...selectedTeams, team]);
        }
    };

    const handleRemoveTeam = (teamId: number) => {
        setSelectedTeams(selectedTeams.filter(team => team.id !== teamId));
    };

    const handleCancel = () => {
        setShowTeamSetup(false);
        setEditingSeason(null);
        setSelectedTeams([]);
        formik.resetForm();
    };

    return(
        <>
            <div>
                {!showTeamSetup ? (
                    <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4>Manage Seasons</h4>
                            <div>
                                <button className="btn btn-secondary me-2" onClick={() => navigate('/Admin')}>
                                    Back to Admin
                                </button>
                                <button className="btn btn-success" onClick={handleNewSeason}>
                                    Create New Season
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="card mb-4">
                            <div className="card-header bg-success text-white">
                                <h4 className="mb-0">{editingSeason ? 'Edit Season & Teams' : 'Create New Season & Teams'}</h4>
                            </div>
                            <div className="card-body">
                                {feedback && (
                                    <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`} role="alert">
                                        {feedback.message}
                                    </div>
                                )}

                                <form onSubmit={formik.handleSubmit}>
                            <div className="row">
                                <div className="col-2">
                                    <TextField label="Start Year" name="startYear" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <TextField label="End Year" name="endYear" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <TextField label="Age" name="ageGroup" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <TextField label="Division" name="division" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <TextField label="Month start" name="monthStart" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <TextField label="Month End" name="monthEnd" formik={formik}/>
                                </div>
                                <div className="col-2">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="active"
                                            name="active"
                                            checked={formik.values.active}
                                            onChange={formik.handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="active">
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Team Management Section */}
                            <div className="mt-4">
                                <h5>Team Management</h5>

                                {/* Selected Teams */}
                                <div className="mb-3">
                                    <h6>Selected Teams ({selectedTeams.length})</h6>
                                    {selectedTeams.length > 0 ? (
                                        <div className="row">
                                            {selectedTeams.map(team => (
                                                <div key={team.id} className="col-md-3 mb-2">
                                                    <div className="card">
                                                        <div className="card-body d-flex justify-content-between align-items-center">
                                                            <span>{team.name}</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleRemoveTeam(team.id)}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No teams selected</p>
                                    )}
                                </div>

                                {/* Available Teams */}
                                <div className="mb-3">
                                    <h6>Available Teams</h6>
                                    <div className="row">
                                        {allTeams
                                            .filter(team => !selectedTeams.find(selected => selected.id === team.id))
                                            .map(team => (
                                                <div key={team.id} className="col-md-3 mb-2">
                                                    <div className="card">
                                                        <div className="card-body d-flex justify-content-between align-items-center">
                                                            <span>{team.name}</span>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleAddTeam(team)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <button type="button" className="btn btn-secondary me-2" onClick={handleCancel}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-success" type="submit">
                                        {editingSeason ? 'Update Season' : 'Create Season'}
                                    </button>
                                </div>
                            </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* Existing Seasons Display */}
                {!showTeamSetup && (
                    <div className="mt-4">
                        <h4>Existing Seasons</h4>
                        {existingSeasons.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Season</th>
                                            <th>Age Group</th>
                                            <th>Division</th>
                                            <th>Period</th>
                                            <th>Active</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {existingSeasons
                                            .sort((a, b) => b.startYear - a.startYear)
                                            .map((season) => (
                                            <tr key={season.id}>
                                                <td>{season.startYear}/{season.endYear}</td>
                                                <td>{season.ageGroup}</td>
                                                <td>{season.division}</td>
                                                <td>{season.monthStart} - {season.monthEnd}</td>
                                                <td>
                                                    <span className={`badge ${season.active ? 'bg-success' : 'bg-secondary'}`}>
                                                        {season.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleSetupTeams(season)}
                                                    >
                                                        Setup Teams
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No existing seasons found.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default AdminSeason;