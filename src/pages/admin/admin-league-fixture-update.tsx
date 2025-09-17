import { useFormik } from "formik";
import { useEffect, useState } from "react";
import TextField from "../../atoms/textfield/textfield";
import { useNavigate, useParams } from "react-router-dom";
import { Fixture } from "../../objects/fixture";
import { GetFixture, PutFixture } from "../../services/fixture-service";

const AdminLeagueFixtureUpdate = () => {
  const { id, id2 } = useParams();
  const navigate = useNavigate();
  const [fixture, setFixture] = useState<Fixture>();
  const [homeTeamScore, setHomeTeamScore] = useState(0);
  const [awayTeamScore, setAwayTeamScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    GetFixture(id2).then((data) => {
      setFixture(data);
      if (data != null) {
        setHomeTeamScore(data.homeTeamScore);
        setAwayTeamScore(data.awayTeamScore);
        formik.setValues({
          homeTeamScore: data.homeTeamScore,
          awayTeamScore: data.awayTeamScore,
        });
      }
    });
  }, [id2]);

  const formik = useFormik({
    initialValues: {
      homeTeamScore: homeTeamScore,
      awayTeamScore: awayTeamScore,
    },
    onSubmit: async (values) => {
      if (fixture != null) {
        setLoading(true);
        try {
          fixture.homeTeamScore =
            parseInt(values.homeTeamScore.toString()) || 0;
          fixture.awayTeamScore =
            parseInt(values.awayTeamScore.toString()) || 0;
          await PutFixture(fixture);
          setFeedback({
            message: "Fixture updated successfully!",
            type: "success",
          });
          setTimeout(() => {
            setFeedback(null);
            navigate("/season/" + id);
          }, 2000);
        } catch (error) {
          setFeedback({
            message: "Error updating fixture. Please try again.",
            type: "error",
          });
          setTimeout(() => setFeedback(null), 3000);
        } finally {
          setLoading(false);
        }
      }
    },
    enableReinitialize: true,
  });

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Update League Fixture</h3>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/season/" + id)}
          disabled={loading}
        >
          Back to Season
        </button>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`alert ${feedback.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      {/* Fixture Details Card */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">Match Details</h5>
            </div>
            <div className="card-body">
              {fixture ? (
                <>
                  <div className="row mb-3">
                    <div className="col-12">
                      <h6 className="text-center">
                        <span className="text-primary">{fixture.homeTeam}</span>
                        <span className="mx-3">
                          <span className="badge bg-secondary mx-1">
                            {fixture.homeTeamScore}
                          </span>
                          vs
                          <span className="badge bg-secondary mx-1">
                            {fixture.awayTeamScore}
                          </span>
                        </span>
                        <span className="text-primary">{fixture.awayTeam}</span>
                      </h6>
                      {fixture.date && (
                        <p className="text-center text-muted mt-2">
                          {new Date(fixture.date).toLocaleDateString("en-GB", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score Update Form */}
                  <form onSubmit={formik.handleSubmit}>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Home Team Score ({fixture.homeTeam})
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="homeTeamScore"
                            min="0"
                            value={formik.values.homeTeamScore}
                            onChange={formik.handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Away Team Score ({fixture.awayTeam})
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            name="awayTeamScore"
                            min="0"
                            value={formik.values.awayTeamScore}
                            onChange={formik.handleChange}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                      <button
                        type="submit"
                        className="btn btn-success px-4"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Updating...
                          </>
                        ) : (
                          "Update Score"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading fixture...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeagueFixtureUpdate;
